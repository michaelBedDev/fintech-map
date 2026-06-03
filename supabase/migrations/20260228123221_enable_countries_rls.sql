alter table "public"."comunidades_autonomas" enable row level security;

alter table "public"."paises" enable row level security;


  create policy "Comunidades are publicly readable"
  on "public"."comunidades_autonomas"
  as permissive
  for select
  to public
using (true);



  create policy "Paises are publicly readable"
  on "public"."paises"
  as permissive
  for select
  to public
using (true);
