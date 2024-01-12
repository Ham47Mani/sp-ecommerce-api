interface RESDATA {
  message:string,
  data?: any[],
  success: boolean
}

export const resData = (message: string, success: boolean, data?: any[]) : RESDATA => {
  return {message, data, success};
}