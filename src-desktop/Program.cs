using System;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;

namespace LockinDesktop
{
    class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                string exeDir = AppDomain.CurrentDomain.BaseDirectory;

                // Look for bundled Electron executable
                string electron1 = Path.Combine(exeDir, "electron.exe");
                string electron2 = Path.Combine(exeDir, "node_modules", "electron", "dist", "electron.exe");
                string electron3 = Path.Combine(exeDir, "..", "node_modules", "electron", "dist", "electron.exe");

                string electronExe = null;
                if (File.Exists(electron1)) electronExe = electron1;
                else if (File.Exists(electron2)) electronExe = electron2;
                else if (File.Exists(electron3)) electronExe = electron3;

                string mainJs = Path.Combine(exeDir, "electron", "main.js");
                if (!File.Exists(mainJs)) mainJs = Path.Combine(exeDir, "..", "electron", "main.js");

                if (electronExe != null && File.Exists(mainJs))
                {
                    ProcessStartInfo psi = new ProcessStartInfo
                    {
                        FileName = electronExe,
                        Arguments = string.Format("\"{0}\"", mainJs),
                        UseShellExecute = false
                    };

                    Process p = Process.Start(psi);
                    if (p != null)
                    {
                        p.WaitForExit();
                    }
                }
            }
            catch (Exception ex)
            {
                try
                {
                    string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                    string errPath = Path.Combine(localAppData, "LOCKIN", "lockin_error.log");
                    Directory.CreateDirectory(Path.GetDirectoryName(errPath));
                    File.WriteAllText(errPath, ex.ToString());
                }
                catch { }
            }
        }
    }
}
