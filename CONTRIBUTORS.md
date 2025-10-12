import os

# 🔧 Change this path to your local clone location
repo_path = r"C:\Users\Zunera\Documents\sea-notes-saas-starter-kit"

# 📄 Name of the file to create
file_name = "CONTRIBUTORS.md"
file_path = os.path.join(repo_path, file_name)

# 📝 File content
content = """# 🧑‍💻 Contributors

Thank you for contributing to **SeaNotes SaaS Starter Kit**!

## 👩‍💻 Contributors List
- **Zunera Shaik** (@zunera-shaik)
- Add your name here after your first contribution!

## 💡 How to Contribute
1. Fork this repository  
2. Create a new branch for your feature or fix  
3. Make your changes and commit them  
4. Push your branch to your fork  
5. Open a Pull Request describing your changes  

Your contributions help improve this open-source SaaS starter kit for everyone 🌊✨
"""

# ✨ Create and write the file
with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"✅ File '{file_name}' created successfully at: {file_path}")
