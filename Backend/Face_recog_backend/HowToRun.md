Steps to Run the Python Backend

1. Clone the repository
   git clone <repo-link>

2. Install Node.js backend dependencies
   npm i

3. Check env.example to ensure all required environment variables exist in your Node.js backend

4. Install Visual Studio Build Tools globally from(necessary):
   [https://aka.ms/vs/17/release/vs_BuildTools.exe](https://aka.ms/vs/17/release/vs_BuildTools.exe)
   (It’s an installer — select the Build Tools workload, around 1 GB)

5. Move to the backend directory
   cd face...

6. Create a virtual environment(venv) here
   python -m venv venv

7. Activate the virtual environment 
   .\venv\Scripts\Activate.ps1      #for powershell
   .\venv\Scripts\Activate.bat      #for cmd

8. Install Python dependencies in venv 
   pip install -r requirements.txt

9. If installation fails:

   * check if build tools are active (try cl.exe or search for it)
   * verify CMake is installed (reinstall if needed)
   * check GCC version (it needs a newer version)
   * try installing dlib with this command: 
        pip install --no-binary=dlib dlib
   * or copy your error and ask AI for help

10. Run both python and node backend in separate terminals
    python app.py (with venv activated)
    npm run dev
