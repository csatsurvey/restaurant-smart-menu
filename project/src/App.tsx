// Менежерийн React код доторх хадгалах функц
const saveToGitHub = async () => {
  setLoading(true);
  try {
    // Шууд GitHub руу биш, өөрийн аюулгүй Бэкэнд API руу датагаа илгээнэ
    const res = await fetch('/api/save-menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentRestaurantId: currentRestaurantId,
        menu: menu // Шинэчлэгдсэн цэс
      })
    });

    const data = await res.json();
    if (data.success) {
      alert("Цэс амжилттай, аюулгүй шинэчлэгдлээ! Вэрсэл 1 минутын дараа вэбсайтыг шинэчлэх болно.");
    } else {
      alert("Хадгалахад алдаа гарлаа. (Backend Error)");
    }
  } catch (error) {
    alert("Сүлжээний алдаа гарлаа.");
  } finally {
    setLoading(false);
  }
};