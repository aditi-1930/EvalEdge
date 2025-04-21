function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
  }
  
  function toggleDarkMode() {
    document.body.classList.toggle('dark');
  }
  document.getElementById("aiBotImage").addEventListener("click", goToChatbot);
document.getElementById("aiBotText").addEventListener("click", goToChatbot);

function goToChatbot() {
  window.location.href = "index.html";
}

  
  function signOut() {
    alert("Signing out...");
  }
  const quotes = [
    "Believe you can and you're halfway there.",
    "Dream it. Wish it. Do it.",
    "Stay positive, work hard, make it happen.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "You are capable of amazing things.",
    "Every day is a second chance.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "Don't watch the clock; do what it does. Keep going.",
    "Great things never come from comfort zones.",
    "Push yourself, because no one else is going to do it for you.",
  ];
 
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById("quote").textContent = randomQuote;
