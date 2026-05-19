export interface EaglenosReading {
  id: number;
  blood_sugar: number;
  trend: number;
  create_time: number;
}

export interface EaglenosDeviceInfo {
  sn: string;
  start_time: number;
  end_time: number;
  report_url: string;
}

export interface EaglenosListResponse {
  code: number;
  msg: string;
  data: {
    list: EaglenosReading[];
    device_info?: EaglenosDeviceInfo;
  };
}

export const EAGLENOS_SUCCESS = 100000;
