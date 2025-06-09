"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loveLetterGenerator, type LoveLetterGeneratorInput, type LoveLetterGeneratorOutput } from "@/ai/flows/love-letter-generator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DecorativeBorder from "./decorative-border";

const FormSchema = z.object({
  relationshipHistory: z.string().min(10, "Please provide some relationship history."),
  loveNotes: z.string().min(5, "Share some love notes or inside jokes."),
  occasion: z.string().min(3, "What's the occasion for this letter?"),
});

type FormData = z.infer<typeof FormSchema>;

export function LoveLetterForm() {
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setGeneratedLetter(null);
    try {
      const input: LoveLetterGeneratorInput = {
        relationshipHistory: data.relationshipHistory,
        loveNotes: data.loveNotes,
        occasion: data.occasion,
      };
      const result: LoveLetterGeneratorOutput = await loveLetterGenerator(input);
      setGeneratedLetter(result.loveLetterSuggestion);
      toast({ title: "Success!", description: "Your love letter suggestion is ready." });
    } catch (error) {
      console.error("Error generating love letter:", error);
      toast({ title: "Error", description: "Failed to generate love letter. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <DecorativeBorder>
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Wand2 className="mr-3 h-8 w-8 text-accent" />
            AI Love Letter Assistant
          </CardTitle>
          <CardDescription className="font-body text-foreground/80">
            Let our AI help you craft the perfect message. Fill in the details below for a personalized suggestion.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="relationshipHistory" className="font-body text-foreground/90">Relationship History</Label>
              <Textarea
                id="relationshipHistory"
                {...register("relationshipHistory")}
                placeholder="Share significant dates, events, and shared experiences..."
                className="min-h-[120px] font-body"
              />
              {errors.relationshipHistory && <p className="text-sm text-destructive font-body">{errors.relationshipHistory.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="loveNotes" className="font-body text-foreground/90">Shared Love Notes & Inside Jokes</Label>
              <Textarea
                id="loveNotes"
                {...register("loveNotes")}
                placeholder="Include snippets of messages, pet names, or funny moments..."
                className="min-h-[100px] font-body"
              />
              {errors.loveNotes && <p className="text-sm text-destructive font-body">{errors.loveNotes.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="occasion" className="font-body text-foreground/90">Occasion</Label>
              <Input
                id="occasion"
                {...register("occasion")}
                placeholder="e.g., Anniversary, Birthday, Just Because"
                className="font-body"
              />
              {errors.occasion && <p className="text-sm text-destructive font-body">{errors.occasion.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
            <Button type="button" variant="outline" onClick={() => reset()} className="w-full sm:w-auto font-body border-primary text-primary hover:bg-primary/10">
              Clear Form
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-body">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Letter
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </DecorativeBorder>

      {generatedLetter && (
        <DecorativeBorder className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Your Love Letter Suggestion</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-body text-foreground/90 whitespace-pre-wrap leading-relaxed p-4 bg-background/50 rounded-md border border-accent/30 shadow-inner">
                {generatedLetter}
              </p>
            </CardContent>
             <CardFooter>
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(generatedLetter).then(() => toast({title: "Copied!", description:"Letter suggestion copied to clipboard."}))} className="font-body border-accent text-accent hover:bg-accent/10">
                    Copy to Clipboard
                </Button>
             </CardFooter>
        </DecorativeBorder>
      )}
    </div>
  );
}
