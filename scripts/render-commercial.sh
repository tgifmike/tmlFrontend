#!/bin/sh
set -eu

project_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
bathroom_video=${1:-/Users/mini/Downloads/ScreenRecording_09-16-2026 11-50-53_1.MP4}
fry_video=${2:-/Users/mini/Downloads/ScreenRecording_09-16-2026 11-52-21_1.MP4}
output_video=${3:-$project_dir/public/videos/the-manager-life-commercial.mp4}

ffmpeg -y \
	-i "$bathroom_video" \
	-i "$fry_video" \
	-loop 1 -framerate 30 -i "$project_dir/public/images/commercial/chef-flambe-kitchen.png" \
	-loop 1 -framerate 30 -i "$project_dir/public/images/commercial/chef-temperature-check.png" \
	-loop 1 -framerate 30 -i "$project_dir/public/images/dashboard/operational-overview.png" \
	-loop 1 -framerate 30 -i "$project_dir/public/images/dashboard/todays-attention.png" \
	-loop 1 -framerate 30 -i "$project_dir/public/images/dashboard/weekday-trends.png" \
	-loop 1 -framerate 30 -i "$project_dir/public/images/dashboard/recurring-item-issues.png" \
	-loop 1 -framerate 30 -i "$project_dir/public/images/dashboard/team-performance.png" \
	-loop 1 -framerate 30 -i "$project_dir/public/newLogo.png" \
	-i "$project_dir/public/videos/music/motivator-kevin-macleod.mp3" \
	-filter_complex_script "$project_dir/scripts/commercial-filter.txt" \
	-map '[vout]' -map '[aout]' \
	-c:v libx264 -preset medium -crf 20 -profile:v high -level 4.1 \
	-c:a aac -b:a 192k -movflags +faststart -shortest \
	"$output_video"
