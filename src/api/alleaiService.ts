import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

// Enhanced error handling for API calls
const handleApiError = (error: any, operation: string): never => {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.detail || error.response.data?.message || error.message;
    if (status === 503) {
      throw new Error(`AI service unavailable: ${message}`);
    } else if (status === 401) {
      throw new Error('AI service authentication failed. Please check configuration.');
    } else if (status === 500) {
      throw new Error(`AI service error: ${message}`);
    } else {
      throw new Error(`API error (${status}): ${message}`);
    }
  } else if (error.request) {
    throw new Error(`Network error: Unable to connect to AI service at ${API_BASE}`);
  } else {
    throw new Error(`${operation} failed: ${error.message}`);
  }
};

/**
 * FreeAI service for all AI-related functionality (no paid API required)
 */
class FreeAIService {
  async generateTitle(prompt: string, models?: string | string[]): Promise<string> {
    try {
      const modelsArray = models ? (Array.isArray(models) ? models : [models]) : undefined;
      const res = await axios.post(`${API_BASE}/ai/generate-title`, { prompt, models: modelsArray });
      return res.data.result;
    } catch (error) {
      console.error('Error generating title:', error);
      handleApiError(error, 'Title generation');
    }
  }

  async generateDescription(prompt: string, models?: string | string[]): Promise<string> {
    try {
      const modelsArray = models ? (Array.isArray(models) ? models : [models]) : undefined;
      const res = await axios.post(`${API_BASE}/ai/generate-description`, { prompt, models: modelsArray });
      return res.data.result;
    } catch (error) {
      console.error('Error generating description:', error);
      handleApiError(error, 'Description generation');
    }
  }

  async generateImage(prompt: string, models?: string | string[]): Promise<string> {
    try {
      const modelsArray = models ? (Array.isArray(models) ? models : [models]) : undefined;
      const res = await axios.post(`${API_BASE}/ai/generate-image`, { prompt, models: modelsArray });
      return res.data.url;
    } catch (error) {
      console.error('Error generating image:', error);
      handleApiError(error, 'Image generation');
    }
  }

  async chat(prompt: string, models?: string | string[]): Promise<string> {
    try {
      const modelsArray = models ? (Array.isArray(models) ? models : [models]) : undefined;
      const res = await axios.post(`${API_BASE}/ai/chat`, { prompt, models: modelsArray });
      return res.data.result;
    } catch (error) {
      console.error('Error in AI chat:', error);
      handleApiError(error, 'AI chat');
    }
  }

  async analyzeDisease(diseaseName: string, confidence: number, cropType: string, models?: string | string[]): Promise<any> {
    try {
      const modelsArray = models ? (Array.isArray(models) ? models : [models]) : undefined;
      const prompt = `${diseaseName}|${confidence}|${cropType}`;
      const res = await axios.post(`${API_BASE}/ai/disease-analysis`, { prompt, models: modelsArray });
      return res.data.result;
    } catch (error) {
      console.error('Error in disease analysis:', error);
      handleApiError(error, 'Disease analysis');
    }
  }

  async getStatus(): Promise<any> {
    try {
      const res = await axios.get(`${API_BASE}/ai/status`);
      return res.data;
    } catch (error) {
      console.error('Error getting AI status:', error);
      return { status: 'error', error: 'Failed to get AI status' };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const status = await this.getStatus();
      return status.status === 'available';
    } catch (error) {
      console.error('Error testing AI connection:', error);
      return false;
    }
  }

  async testBackendConnection(): Promise<{ connected: boolean; error?: string }> {
    try {
      const res = await axios.get(`${API_BASE}/health`);
      return { connected: true };
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const status = await this.getStatus();
      return status.models || [];
    } catch (error) {
      console.error('Error getting available models:', error);
      return [];
    }
  }

  async getTreatmentRecommendations(diseaseName: string, confidence: number, cropType: string, models?: string | string[]): Promise<string> {
    try {
      const prompt = `Provide comprehensive treatment recommendations for ${diseaseName} in ${cropType} crops. Include organic and chemical options, application methods, timing, and safety precautions.`;
      return await this.chat(prompt, models);
    } catch (error) {
      console.error('Error getting treatment recommendations:', error);
      handleApiError(error, 'Treatment recommendations');
    }
  }

  async getPreventionStrategies(diseaseName: string, cropType: string, models?: string | string[]): Promise<string> {
    try {
      const prompt = `Provide comprehensive prevention strategies for ${diseaseName} in ${cropType} crops. Include cultural practices, environmental management, and long-term prevention measures.`;
      return await this.chat(prompt, models);
    } catch (error) {
      console.error('Error getting prevention strategies:', error);
      handleApiError(error, 'Prevention strategies');
    }
  }
}

// Export singleton instance
export const freeaiService = new FreeAIService();

// Export individual functions for backward compatibility
export const generateTitle = (prompt: string, models?: string | string[]) => freeaiService.generateTitle(prompt, models);
export const generateDescription = (prompt: string, models?: string | string[]) => freeaiService.generateDescription(prompt, models);
export const generateImage = (prompt: string, models?: string | string[]) => freeaiService.generateImage(prompt, models);
export const aiChat = (prompt: string, models?: string | string[]) => freeaiService.chat(prompt, models);
export const diseaseAnalysis = (diseaseName: string, confidence: number, cropType: string, models?: string | string[]) => freeaiService.analyzeDisease(diseaseName, confidence, cropType, models);
export const getAIStatus = () => freeaiService.getStatus(); 