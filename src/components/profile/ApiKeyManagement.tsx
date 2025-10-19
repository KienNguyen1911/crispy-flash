
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ApiKeyManagement = () => {
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini");
  const [apiKeyStatus, setApiKeyStatus] = useState("No key saved");

  useEffect(() => {
    const savedKey = localStorage.getItem("gemini-api-key");
    const savedModel = localStorage.getItem("selected-ai-model");
    if (savedKey) {
      setApiKey(savedKey);
      setApiKeyStatus("Key saved");
    }
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem("gemini-api-key", apiKey);
    localStorage.setItem("selected-ai-model", selectedModel);
    setApiKeyStatus("Key saved");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI API Settings</CardTitle>
        <CardDescription>Manage your API Key and select the AI model for enhanced features.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="ai-model">Select AI Model</label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger id="ai-model">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini">Gemini API (Recommended)</SelectItem>
              <SelectItem value="openai">OpenAI API</SelectItem>
              <SelectItem value="custom">Custom Model</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="api-key">API Key</label>
          <Input
            id="api-key"
            type="password"
            placeholder="AIzaSy..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        <Button onClick={handleSaveApiKey}>Save/Update Key</Button>
        <p className="text-sm text-muted-foreground mt-2">{apiKeyStatus}</p>

        <div className="mt-4">
          <h3 className="font-semibold">AI-Powered Features:</h3>
          <ul className="list-disc list-inside text-muted-foreground">
            <li>Generate sentence examples (Gemini)</li>
            <li>Generate illustrative images</li>
            <li>Chat with AI (Gemini)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeyManagement;