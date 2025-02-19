export async function updateTranslation(
  locale: string,
  key: string,
  value: string,
  projectId: number = 1
): Promise<any> {
  const requestBody = {
    locale: locale,
    key: key,
    value: value,
    projectId: projectId,
  };

  try {
    const response = await fetch('http://localhost:3000/translation/update', {
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
    console.error('Error updating translation:', error);
    throw error;
  }
}
