set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.clear_user_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Solo actuamos si el email NO es ya NULL para evitar bucles
  IF (NEW.email IS NOT NULL) THEN
    UPDATE auth.users
    SET 
        email = NULL,
        email_confirmed_at = NULL,
        -- Borramos rastro del email real en el JSON de metadatos
        raw_user_meta_data = raw_user_meta_data - 'email' - 'email_verified'
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE TRIGGER on_auth_user_created_anon AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.clear_user_email();


