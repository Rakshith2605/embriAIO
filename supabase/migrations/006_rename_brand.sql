-- emrAIO — Rename brand from embriAIO to emrAIO

-- Update platform profile name
UPDATE profiles
SET name = 'emrAIO'
WHERE email = 'platform@embriaio.com';

-- Update platform profile email
UPDATE profiles
SET email = 'platform@emraio.com'
WHERE email = 'platform@embriaio.com';

-- Update progress storage key in courses
UPDATE courses
SET progress_storage_key = 'emrAIO_progress_v1'
WHERE progress_storage_key = 'embriAIO_progress_v1';
