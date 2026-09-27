$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'demo-video'
New-Item -ItemType Directory -Force -Path $out | Out-Null

Add-Type -AssemblyName System.Speech
$narration = @'
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="Microsoft Zira Desktop">
    <prosody rate="0%" pitch="+2%">CampusFix connects GDC Ganderbal students with the team responsible for improving campus life.</prosody>
    <break time="500ms"/>
    <prosody rate="-6%">It turns everyday campus problems into clear, trackable actions that are easier to understand and faster to resolve.</prosody>
    <break time="700ms"/>
    <prosody rate="0%">A student can report an issue with a title, a location, a category, a priority, a description, and even an optional photo.</prosody>
    <break time="600ms"/>
    <prosody rate="-8%">For urgent problems, the report can also trigger an administrator alert, helping the right people respond without delay.</prosody>
    <break time="700ms"/>
    <prosody rate="0%">From the admin side, the dashboard brings totals, pending issues, and active cases into one focused view.</prosody>
    <break time="550ms"/>
    <prosody rate="-6%">Teams can review each case, update its status, and follow every step without losing the original context or evidence.</prosody>
    <break time="750ms"/>
    <prosody rate="0%">Once the work is done, the administrator shares a resolution photo, and the student can immediately see the result.</prosody>
    <break time="600ms"/>
    <prosody rate="-8%">Then the reporting student confirms the fix with one tap, closing the loop from report to resolution.</prosody>
    <break time="700ms"/>
    <prosody rate="0%">This is CampusFix, a faster, clearer, and more accountable way to keep the campus safe, responsive, and connected.</prosody>
    <break time="600ms"/>
    <prosody rate="-4%" pitch="+3%">Created by Uzair Rafiq and Huzaif Manzoor.</prosody>
  </voice>
</speak>
'@

$speech = [System.Speech.Synthesis.SpeechSynthesizer]::new()
$speech.Rate = -1
$speech.Volume = 100
$preferredVoice = $speech.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Name -match 'Zira' } | Select-Object -First 1
if ($preferredVoice) { $speech.SelectVoice($preferredVoice.VoiceInfo.Name) }
$speech.SetOutputToWaveFile((Join-Path $out 'narration.wav'))
$speech.SpeakSsml($narration)
$speech.Dispose()

$ffmpeg = Join-Path $root 'node_modules\ffmpeg-static\ffmpeg.exe'
$concat = Join-Path $out 'scenes.txt'
$durations = @(13, 13, 13, 13, 13, 13, 8)
$lines = for ($i = 1; $i -le 7; $i++) { "file 'scene-$i.png'" }
$lines | Set-Content -Encoding ascii $concat

$segments = @()
for ($i = 1; $i -le 7; $i++) {
  $segment = Join-Path $out "segment-$i.mp4"
  & $ffmpeg -y -loop 1 -i (Join-Path $out "scene-$i.png") -t $durations[$i - 1] -r 30 -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,zoompan=z='min(zoom+0.0008,1.08)':d=360:s=1280x720,fade=t=in:st=0:d=0.7,fade=t=out:st=($durations[$i - 1]-0.8):d=0.8" -pix_fmt yuv420p -c:v libx264 $segment | Out-Null
  $segments += "file 'segment-$i.mp4'"
}
$segments | Set-Content -Encoding ascii (Join-Path $out 'segments.txt')
$silent = Join-Path $out 'visuals.mp4'
& $ffmpeg -y -f concat -safe 0 -i (Join-Path $out 'segments.txt') -c copy $silent | Out-Null
& $ffmpeg -y -i $silent -i (Join-Path $out 'narration.wav') -filter_complex '[1:a]apad,volume=1.28[audio]' -map 0:v -map '[audio]' -t 90 -c:v copy -c:a aac (Join-Path $root 'CampusFix-Demo.mp4') | Out-Null
VITE_API_URL=http://YOUR_PUBLIC_IP:4000/api
