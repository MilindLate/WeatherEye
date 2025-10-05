
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Phone, Shield, Siren, AlertTriangle } from 'lucide-react';

const emergencyContacts = [
    { region: "North America (USA, Canada)", number: "911" },
    { region: "United Kingdom", number: "999 or 112" },
    { region: "European Union", number: "112" },
    { region: "Australia", number: "000" },
    { region: "New Zealand", number: "111" },
    { region: "India", number: "112" },
    { region: "Japan", number: "119 (Fire/Ambulance), 110 (Police)" },
    { region: "China", number: "119 (Fire), 120 (Ambulance), 110 (Police)" },
];

const safetyTips = [
    "Stay Indoors: Seek shelter immediately. Stay away from windows, doors, and exterior walls.",
    "Follow Official Advice: Monitor local news and weather authorities for instructions and updates.",
    "Avoid Travel: Do not drive or walk through flooded areas or high winds.",
    "Contact Family: Let your family and friends know you are safe, but avoid long phone calls to keep lines open for emergencies.",
    "Prepare an Emergency Kit: If possible, have a kit with water, non-perishable food, a flashlight, batteries, and a first-aid kit.",
    "Conserve Power: Use your phone only when necessary to save battery.",
];

function EmergencyContent() {
    const searchParams = useSearchParams();
    const city = searchParams.get('city');

    const getDashboardLink = () => {
        const params = new URLSearchParams();
        if (city) params.set('city', city);
        return `/dashboard?${params.toString()}`;
    }

    return (
        <div className="min-h-screen w-full bg-background">
        <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <Button asChild variant="outline">
                    <Link href={getDashboardLink()}>
                        <ArrowLeft className="mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>

                <div className="text-center">
                    <Siren className="mx-auto h-16 w-16 text-destructive" />
                    <h1 className="text-4xl font-bold tracking-tight text-destructive mt-4 font-headline">Weather Emergency Assistance</h1>
                    <p className="text-muted-foreground mt-2">Immediate guidance for severe weather situations.</p>
                </div>

                <Card className="border-yellow-500/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-500">
                            <AlertTriangle />
                            Immediate Safety Tips
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <ul className="list-disc list-inside space-y-2">
                            {safetyTips.map((tip, index) => (
                                <li key={index} className="text-foreground/90">{tip}</li>
                            ))}
                       </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Phone />
                           Global Emergency Numbers
                        </CardTitle>
                        <CardDescription>Dial the number for your region if you are in immediate danger.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {emergencyContacts.map(contact => (
                            <div key={contact.region} className="p-4 rounded-lg bg-muted/50">
                                <p className="font-semibold">{contact.region}</p>
                                <a href={`tel:${contact.number.split(' ')[0]}`} className="text-2xl font-bold text-primary hover:underline">{contact.number}</a>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                 <Card className="bg-blue-950/50 border-blue-500/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-400">
                           <Shield />
                           Important Disclaimer
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-blue-300">This information is for guidance only. Always prioritize instructions from your local emergency services and government authorities. WeatherEye is a tool to assist you, not a replacement for official emergency response.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


export default function EmergencyPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <EmergencyContent />
        </Suspense>
    )
}
