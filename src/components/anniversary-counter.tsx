"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { differenceInDays, differenceInMonths, differenceInYears, addYears, formatDistanceToNowStrict, isValid, parseISO, format } from "date-fns";
import DecorativeBorder from "./decorative-border";

const defaultAnniversary = "2020-01-01"; // Default date

export function AnniversaryCounter() {
  const [anniversaryDate, setAnniversaryDate] = useState<Date | null>(null);
  const [inputDate, setInputDate] = useState<string>("");
  const [timeSince, setTimeSince] = useState({ years: 0, months: 0, days: 0 });
  const [nextAnniversaryCountdown, setNextAnniversaryCountdown] = useState<string>("");

  useEffect(() => {
    const storedDate = localStorage.getItem("anniversaryDate");
    const initialDate = storedDate ? parseISO(storedDate) : parseISO(defaultAnniversary);
    if (isValid(initialDate)) {
      setAnniversaryDate(initialDate);
      setInputDate(format(initialDate, "yyyy-MM-dd"));
    }
  }, []);

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

  const handleSetDate = () => {
    const newDate = parseISO(inputDate);
    if (isValid(newDate)) {
      setAnniversaryDate(newDate);
      localStorage.setItem("anniversaryDate", inputDate);
    } else {
      alert("Invalid date format. Please use YYYY-MM-DD.");
    }
  };

  if (!anniversaryDate) {
    return (
      <Card className="shadow-xl border-primary/20">
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
            />
          </div>
          <Button onClick={handleSetDate} className="bg-primary hover:bg-primary/90 text-primary-foreground">Set Date</Button>
        </CardContent>
      </Card>
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
            />
            <Button onClick={handleSetDate} variant="outline" className="border-primary text-primary hover:bg-primary/10">Update</Button>
            </div>
          </div>
      </CardContent>
    </DecorativeBorder>
  );
}
