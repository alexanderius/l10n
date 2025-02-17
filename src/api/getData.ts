export async function getData(): Promise<any> {
  try {
    const response = await fetch('http://localhost:3000/');

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка при получении данных с сервера:', error);
    throw error;
  }
}
