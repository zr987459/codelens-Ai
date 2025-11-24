
export const INITIAL_HTML = `<!-- 现代响应式落地页模板 -->
<nav class="navbar">
  <div class="logo">MyWebsite</div>
  <div class="nav-links">
    <a href="#hero">首页</a>
    <a href="#features">特性</a>
    <a href="#contact">联系</a>
    <button class="cta-btn" onclick="showAlert()">开始使用</button>
  </div>
  <div class="menu-toggle" id="mobile-menu">
    <span></span>
    <span></span>
    <span></span>
  </div>
</nav>

<header id="hero" class="hero-section">
  <div class="hero-content">
    <h1>构建您的<span class="highlight">梦想网站</span></h1>
    <p>这是一个完全响应式的现代化网页模板。您可以使用 CodeLens AI 随意修改文案、配色或布局。</p>
    <div class="hero-btns">
      <button class="primary-btn">了解更多</button>
      <button class="secondary-btn">观看演示</button>
    </div>
  </div>
  <div class="hero-image">
    <div class="placeholder-img">🚀</div>
  </div>
</header>

<section id="features" class="features-section">
  <h2>核心特性</h2>
  <div class="feature-grid">
    <div class="card">
      <div class="icon">⚡</div>
      <h3>极速响应</h3>
      <p>加载速度快，交互流畅，给用户最佳体验。</p>
    </div>
    <div class="card">
      <div class="icon">🎨</div>
      <h3>现代设计</h3>
      <p>遵循最新的设计趋势，简约而不简单。</p>
    </div>
    <div class="card">
      <div class="icon">📱</div>
      <h3>移动端适配</h3>
      <p>无论在手机、平板还是电脑上，显示效果都完美。</p>
    </div>
  </div>
</section>

<footer id="contact">
  <p>&copy; 2024 MyWebsite. 使用 CodeLens AI 构建。</p>
</footer>`;

export const INITIAL_CSS = `:root {
  --primary: #2563eb;
  --secondary: #1e293b;
  --text: #334155;
  --bg: #f8fafc;
  --white: #ffffff;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--text);
  background: var(--bg);
  line-height: 1.6;
}

/* Navbar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 5%;
  background: var(--white);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary);
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: var(--secondary);
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: var(--primary);
}

.cta-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.3s;
}

.cta-btn:hover {
  opacity: 0.9;
}

/* Mobile Menu */
.menu-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 5px;
}

.menu-toggle span {
  width: 25px;
  height: 3px;
  background-color: var(--secondary);
}

/* Hero Section */
.hero-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4rem 5%;
  min-height: 80vh;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
}

.hero-content {
  flex: 1;
  max-width: 600px;
}

.hero-content h1 {
  font-size: 3.5rem;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  color: var(--secondary);
}

.highlight {
  color: var(--primary);
}

.hero-content p {
  font-size: 1.2rem;
  color: #64748b;
  margin-bottom: 2rem;
}

.hero-btns {
  display: flex;
  gap: 1rem;
}

.primary-btn, .secondary-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 600;
}

.primary-btn {
  background: var(--primary);
  color: white;
  border: none;
}

.secondary-btn {
  background: white;
  color: var(--secondary);
  border: 1px solid #cbd5e1;
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
}

.placeholder-img {
  font-size: 8rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* Features */
.features-section {
  padding: 5rem 5%;
  text-align: center;
  background: var(--white);
}

.features-section h2 {
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: var(--secondary);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.card {
  padding: 2rem;
  background: #f8fafc;
  border-radius: 12px;
  transition: transform 0.3s;
  border: 1px solid #e2e8f0;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
}

.icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.card h3 {
  margin-bottom: 0.5rem;
  color: var(--secondary);
}

.card p {
  color: #64748b;
  font-size: 0.95rem;
}

/* Footer */
footer {
  text-align: center;
  padding: 2rem;
  background: var(--secondary);
  color: #94a3b8;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  .menu-toggle {
    display: flex;
  }
  .hero-section {
    flex-direction: column-reverse;
    text-align: center;
    padding-top: 2rem;
  }
  .hero-btns {
    justify-content: center;
  }
  .hero-content h1 {
    font-size: 2.5rem;
  }
}`;

export const INITIAL_JS = `// 交互逻辑
function showAlert() {
  alert('感谢您的点击！AI 可以帮您为这个按钮添加跳转链接或表单弹窗。');
}

// 移动端菜单切换逻辑
const menuToggle = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    // 简单的切换显示逻辑，实际项目中可以添加 slide 动画
    if (navLinks.style.display === 'flex') {
      navLinks.style.display = 'none';
      navLinks.style.position = '';
    } else {
      navLinks.style.display = 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '60px';
      navLinks.style.left = '0';
      navLinks.style.width = '100%';
      navLinks.style.background = 'white';
      navLinks.style.padding = '1rem';
      navLinks.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    }
  });
}

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});`;

export const BLANK_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Project</title>
</head>
<body>
  <div class="container">
    <h1>Hello World</h1>
    <p>Start coding...</p>
  </div>
</body>
</html>`;

export const BLANK_CSS = `body {
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  background-color: #f0f0f0;
}

.container {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}`;

export const BLANK_JS = `console.log('Hello from CodeLens!');`;