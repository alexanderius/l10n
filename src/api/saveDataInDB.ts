export async function saveDataInDB(
  fileName: string,
  translations: any
): Promise<any> {
  const requestBody = {
    fileName: fileName,
    translations: translations,
  };

  try {
    const response = await fetch('http://localhost:3000/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving translations:', error);
    throw error;
  }
}
