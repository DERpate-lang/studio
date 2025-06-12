
"use client";

import { useEffect, useState } from "react";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Removed Card import as it's not directly used here, DecorativeBorder handles the card-like structure
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { differenceInDays, differenceInMonths, differenceInYears, addYears, formatDistanceToNowStrict, isValid, parseISO, format } from "date-fns";
import DecorativeBorder from "./decorative-border";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const defaultAnniversary = "2020-01-01"; // Default date
const FIRESTORE_COLLECTION = "app_config";
const FIRESTORE_DOC_ID = "anniversary";

export function AnniversaryCounter() {
  const [anniversaryDate, setAnniversaryDate] = useState<Date | null>(null);
  const [inputDate, setInputDate] = useState<string>("");
  const [timeSince, setTimeSince] = useState({ years: 0, months: 0, days: 0 });
  const [nextAnniversaryCountdown, setNextAnniversaryCountdown] = useState<string>("");
  const [isLoadingDate, setIsLoadingDate] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadAnniversaryDate = async () => {
      setIsLoadingDate(true);
      try {
        const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
        const docSnap = await getDoc(docRef);

        let dateToSet = defaultAnniversary;

        if (docSnap.exists() && docSnap.data()?.date) {
          dateToSet = docSnap.data().date;
        } else {
          const storedDate = localStorage.getItem("anniversaryDate");
          if (storedDate) {
            dateToSet = storedDate;
          }
        }
        
        const initialDate = parseISO(dateToSet);
        if (isValid(initialDate)) {
          setAnniversaryDate(initialDate);
          setInputDate(format(initialDate, "yyyy-MM-dd"));
        } else {
          // Fallback if date from Firestore/localStorage is invalid
          const fallbackDate = parseISO(defaultAnniversary);
          setAnniversaryDate(fallbackDate);
          setInputDate(format(fallbackDate, "yyyy-MM-dd"));
        }
      } catch (error) {
        console.error("Error fetching anniversary date from Firestore:", error);
        toast({
          title: "Error Loading Date",
          description: "Could not load anniversary date from database. Using local or default.",
          variant: "destructive",
        });
        // Fallback to localStorage or default if Firestore fails
        const storedDate = localStorage.getItem("anniversaryDate");
        const fallbackDate = storedDate ? parseISO(storedDate) : parseISO(defaultAnniversary);
        if (isValid(fallbackDate)) {
            setAnniversaryDate(fallbackDate);
            setInputDate(format(fallbackDate, "yyyy-MM-dd"));
        }
      } finally {
        setIsLoadingDate(false);
      }
    };

    loadAnniversaryDate();
  }, [toast]);

  useEffect(() => {
    if (anniversaryDate && isValid(anniversaryDate)) {
      const now = new Date();
      setTimeSince({
        years: differenceInYears(now, anniversaryDate),
        months: differenceInMonths(now, anniversaryDate) % 12,
        days: differenceInDays(now, anniversaryDate) % 30, // Approximate days
      });

      let nextAnniversary = addYears(anniversaryDate, differenceInYears(now, anniversaryDate));
      if (now > nextAnniversary) {
        nextAnniversary = addYears(nextAnniversary, 1);
      }
      setNextAnniversaryCountdown(formatDistanceToNowStrict(nextAnniversary, { addSuffix: true }));

      const timer = setInterval(() => {
        const currentNow = new Date();
        setTimeSince({
          years: differenceInYears(currentNow, anniversaryDate),
          months: differenceInMonths(currentNow, anniversaryDate) % 12,
          days: differenceInDays(currentNow, anniversaryDate) % 30,
        });
        let currentNextAnniversary = addYears(anniversaryDate, differenceInYears(currentNow, anniversaryDate));
        if (currentNow > currentNextAnniversary) {
            currentNextAnniversary = addYears(currentNextAnniversary, 1);
        }
        setNextAnniversaryCountdown(formatDistanceToNowStrict(currentNextAnniversary, { addSuffix: true }));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [anniversaryDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputDate(e.target.value);
  };

  const handleSetDate = async () => {
    const newDate = parseISO(inputDate);
    if (isValid(newDate)) {
      setIsSaving(true);
      try {
        const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
        await setDoc(docRef, { date: inputDate }, { merge: true });
        setAnniversaryDate(newDate);
        localStorage.setItem("anniversaryDate", inputDate);
        toast({
          title: "Date Saved",
          description: "Anniversary date updated successfully in the database.",
        });
      } catch (error) {
        console.error("Error saving anniversary date to Firestore:", error);
        toast({
          title: "Save Error",
          description: "Could not save anniversary date to database. Please check Firestore permissions.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    } else {
      toast({
        title: "Invalid Date",
        description: "Please use YYYY-MM-DD format.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingDate) {
    return (
      <DecorativeBorder>
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary drop-shadow-sm">Our Journey Together</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 font-body text-foreground/80">Loading anniversary date...</p>
        </CardContent>
      </DecorativeBorder>
    );
  }

  if (!anniversaryDate) { // Should not happen if loading logic is correct, but as a safeguard
    return (
      <DecorativeBorder>
        <CardHeader>
          <CardTitle className="font-headline text-primary">Set Your Anniversary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="anniversary-date-input" className="text-foreground/80 font-body">Anniversary Date (YYYY-MM-DD)</Label>
            <Input
              id="anniversary-date-input"
              type="date"
              value={inputDate}
              onChange={handleDateChange}
              className="mt-1"
              disabled={isSaving}
            />
          </div>
          <Button onClick={handleSetDate} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Set Date
          </Button>
        </CardContent>
      </DecorativeBorder>
    );
  }

  return (
    <DecorativeBorder>
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-primary drop-shadow-sm">Our Journey Together</CardTitle>
        <CardDescription className="font-body text-foreground/80">
          Since {format(anniversaryDate, "MMMM d, yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-background/50 rounded-lg shadow">
            <p className="font-headline text-4xl text-accent">{timeSince.years}</p>
            <p className="font-body text-sm text-foreground/70">Years</p>
          </div>
          <div className="p-4 bg-background/50 rounded-lg shadow">
            <p className="font-headline text-4xl text-accent">{timeSince.months}</p>
            <p className="font-body text-sm text-foreground/70">Months</p>
          </div>
          <div className="p-4 bg-background/50 rounded-lg shadow">
            <p className="font-headline text-4xl text-accent">{timeSince.days}</p>
            <p className="font-body text-sm text-foreground/70">Days</p>
          </div>
        </div>
        <div className="text-center p-4 bg-primary/10 rounded-lg shadow">
          <p className="font-headline text-2xl text-primary">Next Anniversary</p>
          <p className="font-body text-lg text-accent">{nextAnniversaryCountdown}</p>
        </div>
         <div className="pt-4">
            <Label htmlFor="anniversary-date-input" className="text-foreground/80 font-body block mb-2 text-sm">Change Anniversary Date (YYYY-MM-DD)</Label>
            <div className="flex gap-2">
            <Input
              id="anniversary-date-input"
              type="date"
              value={inputDate}
              onChange={handleDateChange}
              className="flex-grow"
              disabled={isSaving}
            />
            <Button onClick={handleSetDate} variant="outline" className="border-primary text-primary hover:bg-primary/10" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Update
            </Button>
            </div>
          </div>
      </CardContent>
    </DecorativeBorder>
  );
}

    