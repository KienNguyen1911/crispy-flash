
"use client";
import { useReducer, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type State = {
  apiKey: string;
  selectedModel: string;
  apiKeyStatus: string;
};

type Action = 
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'SET_MODEL'; payload: string }
  | { type: 'SET_STATUS'; payload: string }
  | { type: 'LOAD_FROM_STORAGE'; payload: { apiKey: string; selectedModel: string } };

const initialState: State = {
  apiKey: "",
  selectedModel: "gemini",
  apiKeyStatus: "No key saved"
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_API_KEY':
      return { ...state, apiKey: action.payload };
    case 'SET_MODEL':
      return { ...state, selectedModel: action.payload };
    case 'SET_STATUS':
      return { ...state, apiKeyStatus: action.payload };
    case 'LOAD_FROM_STORAGE':
      return {
        ...state,
        apiKey: action.payload.apiKey,
        selectedModel: action.payload.selectedModel,
        apiKeyStatus: action.payload.apiKey ? "Key saved" : "No key saved"
      };
    default:
      return state;
  }
};

const ApiKeyManagement = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const savedKey = localStorage.getItem("gemini-api-key") || "";
    const savedModel = localStorage.getItem("selected-ai-model") || "gemini";
    dispatch({ type: 'LOAD_FROM_STORAGE', payload: { apiKey: savedKey, selectedModel: savedModel } });
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem("gemini-api-key", state.apiKey);
    localStorage.setItem("selected-ai-model", state.selectedModel);
    dispatch({ type: 'SET_STATUS', payload: "Key saved" });
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
          <Select value={state.selectedModel} onValueChange={(value) => dispatch({ type: 'SET_MODEL', payload: value })}>
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
            value={state.apiKey}
            onChange={(e) => dispatch({ type: 'SET_API_KEY', payload: e.target.value })}
          />
        </div>

        <Button onClick={handleSaveApiKey}>Save/Update Key</Button>
        <p className="text-sm md:text-base text-muted-foreground mt-2">{state.apiKeyStatus}</p>

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