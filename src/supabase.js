import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://boosiwjmzafecgvteifj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyNjgzMDMyNCwiZXhwIjoxOTQyNDA2MzI0fQ.JyyCCGLE88767Xfq1-XTPOXJXkAGEDI0UuVeG8MEQhk'
)

export { supabase }