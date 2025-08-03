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