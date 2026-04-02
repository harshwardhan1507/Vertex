const fs = require('fs');

try {
  fs.renameSync(
    'd:/Programming/Vertex/app/(organizer)',
    'd:/Programming/Vertex/app/organizer'
  );
  console.log("Renamed successfully");
} catch(e) {
  console.error(e);
}
