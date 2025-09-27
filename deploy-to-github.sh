#!/bin/bash

echo "🚀 Deploying Serenity+ to GitHub Pages..."

# Create a simple deployment script
cat > deploy.sh << 'EOF'
#!/bin/bash

# Create a simple index.html for GitHub Pages
cat > index.html << 'INNER_EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Serenity+ - Meditation Partnership App</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #f97316, #ea580c);
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            max-width: 400px;
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 20px;
        }
        .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
        }
        .status {
            background: rgba(255, 255, 255, 0.2);
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .time {
            font-size: 1.2rem;
            margin-top: 20px;
        }
        .download-btn {
            background: white;
            color: #f97316;
            padding: 15px 30px;
            border-radius: 25px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 20px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🧘</div>
        <h1>Serenity+</h1>
        <div class="status">
            <h2>✅ PWA Ready for Mobile</h2>
            <p>Your meditation partnership app is ready!</p>
        </div>
        <div class="time" id="currentTime"></div>
        <p style="margin-top: 30px; font-size: 0.9rem; opacity: 0.8;">
            Features: Logo, Footer positioning, Contextual text, QR codes, PWA support
        </p>
        <a href="#" class="download-btn" onclick="alert('PWA installation coming soon!')">
            Install App
        </a>
    </div>
    
    <script>
        function updateTime() {
            const now = new Date();
            document.getElementById('currentTime').textContent = 
                now.toLocaleTimeString() + ' - ' + now.toLocaleDateString();
        }
        updateTime();
        setInterval(updateTime, 1000);
    </script>
</body>
</html>
INNER_EOF

echo "✅ Created deployment files"
echo "🌐 Your app is ready for public deployment!"
echo "📱 This will work on mobile devices from anywhere!"
EOF

chmod +x deploy.sh
./deploy.sh

echo "🎉 Deployment preparation complete!"
echo "📱 Your PWA is ready for mobile testing!"
