#!/bin/bash
sed -i '' 's/const \[location, setLocation\] =/const [userLocation, setUserLocation] =/' src/app/client/layout.tsx
sed -i '' 's/setLocation(/setUserLocation(/g' src/app/client/layout.tsx
sed -i '' 's/{location &&/{userLocation &&/' src/app/client/layout.tsx
sed -i '' 's/location\.wilaya_name/userLocation.wilaya_name/g' src/app/client/layout.tsx
sed -i '' 's/location\.baladiya_name/userLocation.baladiya_name/g' src/app/client/layout.tsx
sed -i '' 's/location=/userLocation=/g' src/app/client/layout.tsx

sed -i '' 's/const \[location, setLocation\] =/const [userLocation, setUserLocation] =/' src/app/client/page.tsx
sed -i '' 's/setLocation(/setUserLocation(/g' src/app/client/page.tsx
sed -i '' 's/!location &&/!userLocation &&/' src/app/client/page.tsx
sed -i '' 's/location &&/userLocation &&/g' src/app/client/page.tsx
sed -i '' 's/location=/userLocation=/g' src/app/client/page.tsx

rm -rf src_backup
git add src/app/client/layout.tsx src/app/client/page.tsx
git commit -m "Rename location state to userLocation"
git push
