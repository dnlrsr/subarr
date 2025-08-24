import { toast } from "react-toastify";

export async function getErrorResponse(res, returnRawError) {
  let errorText = `Server responded with ${res.status}`;
  let bodyText;

  try {
    bodyText = await res.text(); // Read once
  }
  catch (err) {
    return errorText;
  }

  try {
    const resJson = JSON.parse(bodyText);
    if (resJson?.error) {
      return returnRawError ? resJson.error : `Server responded with "${resJson.error}"`;
    }
    else {
      return errorText;
    }
  }
  catch (jsonErr) {
    return returnRawError ? bodyText : `Server responded with: ${bodyText}`;
  }
}

export const showToast = (message, type = "default") => {
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    case "info":
      toast.info(message);
      break;
    case "warn":
      toast.warn(message);
      break;
    default:
      toast(message);
  }
};