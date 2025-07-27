export async function getErrorResponse(res) {
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
      return `Server responded with "${resJson.error}"`;
    }
    else {
      return errorText;
    }
  }
  catch (jsonErr) {
    return `Server responded with: ${bodyText}`;
  }
}