export async function getDataFromDB(): Promise<any> {
  try {
    const response = await fetch('http://localhost:3000/');

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error when receiving data from the server:', error);
    throw error;
  }
}
