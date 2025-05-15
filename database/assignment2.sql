-- Task 1: The Tony Stark insert SQL statement works.
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- Task 2: The Tony Stark update SQL statement works.
UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

-- Task 3: The delete Tony Stark SQL statement works.
DELETE FROM public.account
WHERE account_email = 'tony@starkent.com';

-- Task 4: The description update SQL statement works.
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- Task 5: The select query using a JOIN SQL statement works.
SELECT inventory.inv_make, inventory.inv_model, classification.classification_name
FROM public.inventory
INNER JOIN public.classification
ON inventory.classification_id = classification.classification_id
WHERE classification.classification_name = 'Sport';

-- Task 6: The inv_image and inv_thumbnail update query works.
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
