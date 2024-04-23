// pages/Settings/Settings.tsx

"use client"

import React from 'react';
import './Settings.css';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";


const Settings: React.FC = () => {
    return (
        <div className="settings-container">
            <h1>Settings</h1>
            <Tabs defaultValue="export">
                <TabsList>
                    <TabsTrigger value="export">Export Data</TabsTrigger>
                    {/* Add more tabs here */}
                </TabsList>
                <TabsContent value="export">
                  
                </TabsContent>
                {/* Add more tab contents here */}
            </Tabs>
        </div>
    );
};

export default Settings;