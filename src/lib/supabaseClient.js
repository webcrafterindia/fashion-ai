import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qwgsqpowaoynjulmxcry.supabase.co/'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3Z3NxcG93YW95bmp1bG14Y3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1OTExMDEsImV4cCI6MjA3MDE2NzEwMX0.FVJE-3piL2FEHsJXlIpE0ZvSkahS-OMHzsjGElQJfKw'
export const supabase = createClient(supabaseUrl, supabaseKey)
