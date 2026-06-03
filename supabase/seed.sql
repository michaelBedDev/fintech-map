-- 1. LIMPIEZA DE USUARIOS SEMILLA
DELETE FROM auth.users WHERE raw_user_meta_data->>'is_seed' = 'true';

-- 2. INSERTAR 150 USUARIOS
INSERT INTO auth.users (id, email, instance_id, role, aud, email_confirmed_at, is_anonymous, is_sso_user, raw_user_meta_data)
SELECT
    gen_random_uuid(),
    'user_seed_' || i || '@test.com',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    now(),
    false,
    false,
    jsonb_build_object(
        'full_name', (
            (ARRAY['Miguel', 'Laura', 'Carlos', 'Elena', 'Javier', 'Sonia', 'Sergio', 'Marta', 'David', 'Lucía', 'Adrián', 'Carmen', 'Hugo', 'Sara', 'Álvaro', 'Paula', 'Raquel', 'Diego', 'Irene', 'Pablo'])[floor(random() * 20 + 1)] || ' ' ||
            (ARRAY['García', 'López', 'Sanz', 'Jiménez', 'Ruiz', 'Ferrero', 'Castro', 'Méndez', 'Ortiz', 'Cano', 'Rivas', 'Vega', 'Marín', 'Peñas', 'Soler', 'Vila', 'Núñez', 'Rey', 'Gómez', 'Pérez'])[floor(random() * 20 + 1)]
        ),
        'user_name', 'user_seed_' || i,
        'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || i,
        'is_seed', true,
        'temp_idx', i
    )
FROM generate_series(1, 150) s(i);

-- 3. ACTUALIZAR PROVINCIAS (FORZANDO ALEATORIEDAD REAL)
UPDATE public.profiles p
SET provincia_id = (
    SELECT id
    FROM public.provincias
    -- Aquí está el truco: al mencionar 'p.id', obligamos a Postgres a
    -- re-ejecutar esta subconsulta para cada fila individualmente.
    WHERE p.id IS NOT NULL
    ORDER BY random()
    LIMIT 1
)
WHERE p.id IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_seed' = 'true'
);
