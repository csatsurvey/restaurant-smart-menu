// api/save-menu.js (Vercel Serverless Function)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { currentRestaurantId, menu } = req.body;
    
    // Нууцлагдсан бэкэнд токен (Фронтэнд харагдахгүй)
    const token = process.env.GITHUB_TOKEN; 
    const githubUrl = "https://api.github.com/repos/csatsurvey/restaurant-smart-menu/contents/src/data/restaurants.json";

    // 1. GitHub-аас одоо байгаа файлыг татах
    const githubGet = await fetch(githubUrl, {
      headers: { Authorization: `token ${token}` }
    });
    const fileData = await githubGet.json();
    const sha = fileData.sha;
    const allRestaurants = JSON.parse(atob(fileData.content));

    // 2. Зөвхөн тухайн рестораны цэсийг шинэчлэх
    allRestaurants[currentRestaurantId].menu = menu;

    // 3. GitHub руу буцааж аюулгүй хадгалах
    const githubPut = await fetch(githubUrl, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `chore: Менежер цэс найдвартай шинэчиллээ (${currentRestaurantId})`,
        content: btoa(unescape(encodeURIComponent(JSON.stringify(allRestaurants, null, 2)))),
        sha: sha
      })
    });

    if (githubPut.ok) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: 'GitHub update failed' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}