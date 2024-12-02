# output.ps1

param (
    [string]$tempPath
)


$content = @"
{
    "suppressions": {
      "azure-sdk-for-js": [
        {
          "breaking-changes": [
            "Operation VirtualMachineInstances.beginStop has a new signature",
            "Operation VirtualMachineInstances.beginStopAndWait has a new signature"
          ]
        }
      ]
    }
}
"@
  
$content | Out-File -FilePath $tempPath -Encoding utf8
# Add-Content -Path $env:GITHUB_OUTPUT -Value "my_output=$content"