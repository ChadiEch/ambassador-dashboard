import axios from './axios';

export interface ManualActivity {
  id: string;
  mediaType: string;
  timestamp: string;
  permalink: string;
}

export interface CreateManualActivityDto {
  userId: string;
  mediaType: string;
  timestamp: string;
}

class ManualActivityAPI {
  async createManualActivity(data: CreateManualActivityDto): Promise<ManualActivity> {
    const response = await axios.post('/manual-activity', data);
    return response.data;
  }

  async getManualActivities(userId: string): Promise<ManualActivity[]> {
    const response = await axios.get(`/manual-activity/user/${userId}`);
    return response.data;
  }
}

export const manualActivityAPI = new ManualActivityAPI();
export default manualActivityAPI;