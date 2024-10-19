using System;
using System.Diagnostics;

class Program
{
    static void Main(string[] args)
    {
        ProcessStartInfo startInfo = new ProcessStartInfo("node", "server.js");
        startInfo.UseShellExecute = false;
        startInfo.RedirectStandardOutput = true;

        using (Process process = Process.Start(startInfo))
        {
            using (System.IO.StreamReader reader = process.StandardOutput)
            {
                string result = reader.ReadToEnd();
                Console.WriteLine(result);
            }
        }
    }
}
