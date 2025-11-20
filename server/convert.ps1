param(
    [string]$inputFile,
    [string]$outputFile
)

try {
    $ppt = New-Object -ComObject PowerPoint.Application
    # $ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue # Uncomment if needed for debugging, but headless is better
    
    $presentation = $ppt.Presentations.Open($inputFile, 0, 0, 0)
    
    # 32 is ppSaveAsPDF
    $presentation.SaveAs($outputFile, 32)
    $presentation.Close()
    
    $ppt.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
    Write-Host "Conversion Success"
} catch {
    Write-Error "Conversion Failed: $_"
    exit 1
}
