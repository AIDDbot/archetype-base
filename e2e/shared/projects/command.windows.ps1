Add-Type -TypeDefinition @"
using System;
using System.Text;
using System.Runtime.InteropServices;
using System.Threading;
public static class OwnedCommand {
  [StructLayout(LayoutKind.Sequential)] struct Startup { public uint cb; public string reserved, desktop, title; public uint x,y,xSize,ySize,xChars,yChars,fill,flags; public short show,reservedSize; public IntPtr reservedPointer,input,output,error; }
  [StructLayout(LayoutKind.Sequential)] struct ProcessInfo { public IntPtr process,thread; public uint id,threadId; }
  [StructLayout(LayoutKind.Sequential)] struct Accounting { public long user,kernel,periodUser,periodKernel; public uint faults,total,active,terminated; }
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)] static extern bool CreateProcess(string app, StringBuilder command, IntPtr pa, IntPtr ta, bool inherit, uint flags, IntPtr env, string cwd, ref Startup startup, out ProcessInfo info);
  [DllImport("kernel32.dll")] static extern IntPtr CreateJobObject(IntPtr attributes, string name);
  [DllImport("kernel32.dll")] static extern bool AssignProcessToJobObject(IntPtr job, IntPtr process);
  [StructLayout(LayoutKind.Explicit, Size=144)] struct Limits { [FieldOffset(16)] public uint flags; }
  [DllImport("kernel32.dll")] static extern bool SetInformationJobObject(IntPtr job, int kind, ref Limits limits, uint size);
  [DllImport("kernel32.dll")] static extern bool TerminateJobObject(IntPtr job, uint code);
  [DllImport("kernel32.dll")] static extern bool QueryInformationJobObject(IntPtr job, int kind, out Accounting accounting, uint size, IntPtr returned);
  [DllImport("kernel32.dll")] static extern uint ResumeThread(IntPtr thread);
  [DllImport("kernel32.dll")] static extern uint WaitForSingleObject(IntPtr handle, uint milliseconds);
  [DllImport("kernel32.dll")] static extern bool TerminateProcess(IntPtr process, uint code);
  [DllImport("kernel32.dll")] static extern bool GetExitCodeProcess(IntPtr process, out uint code);
  [DllImport("kernel32.dll")] static extern IntPtr GetStdHandle(int kind);
  [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr handle);
  public static int Run(string command) {
    var job = CreateJobObject(IntPtr.Zero, null);
    var limits = new Limits { flags=8192 };
    if (!SetInformationJobObject(job, 9, ref limits, 144)) throw new System.ComponentModel.Win32Exception();
    var startup = new Startup { cb=(uint)Marshal.SizeOf(typeof(Startup)), flags=256, input=GetStdHandle(-10), output=GetStdHandle(-11), error=GetStdHandle(-12) };
    ProcessInfo child;
    if (!CreateProcess(null, new StringBuilder("cmd.exe /d /s /c \"" + command + "\""), IntPtr.Zero, IntPtr.Zero, true, 4, IntPtr.Zero, null, ref startup, out child)) throw new System.ComponentModel.Win32Exception();
    if (!AssignProcessToJobObject(job, child.process)) { var error=Marshal.GetLastWin32Error(); TerminateProcess(child.process, 1); CloseHandle(child.thread); CloseHandle(child.process); CloseHandle(job); throw new System.ComponentModel.Win32Exception(error); }
    ResumeThread(child.thread);
    var stop = Console.In.ReadLineAsync();
    uint code=0;
    while (!stop.IsCompleted && WaitForSingleObject(child.process, 25) != 0) {}
    if (!stop.IsCompleted) GetExitCodeProcess(child.process, out code);
    if (!TerminateJobObject(job, code)) throw new System.ComponentModel.Win32Exception();
    Accounting accounting;
    do { Thread.Sleep(10); if (!QueryInformationJobObject(job, 1, out accounting, (uint)Marshal.SizeOf(typeof(Accounting)), IntPtr.Zero)) throw new System.ComponentModel.Win32Exception(); } while (accounting.active != 0);
    CloseHandle(child.thread); CloseHandle(child.process); CloseHandle(job);
    return (int)code;
  }
}
"@
try { exit [OwnedCommand]::Run($env:AIDD_OWNED_COMMAND) }
catch { [Console]::Error.WriteLine($_.Exception.Message); exit 1 }


