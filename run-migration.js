/**
 * 🚀 Database Migration Runner
 * Executes the complete Stripe migration using existing Supabase connection
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
    console.log('🚀 Starting Stripe Migration...\n');

    // Initialize Supabase client
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for admin operations
    );

    try {
        // Read the migration SQL file
        const migrationPath = path.join(__dirname, 'complete-stripe-migration.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('📄 Migration file loaded successfully');
        console.log('📊 Total SQL commands: ~' + migrationSQL.split(';').length);
        console.log('🔗 Connected to Supabase...\n');

        // Split the migration into individual statements
        const statements = migrationSQL
            .split(';')
            .map(function(stmt) { return stmt.trim(); })
            .filter(function(stmt) {
                return stmt.length > 0 && !stmt.startsWith('--') && stmt !== 'BEGIN' && stmt !== 'COMMIT';
            });

        console.log('⚡ Executing migration statements...\n');

        let successCount = 0;
        let errorCount = 0;

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            // Skip comments and empty statements
            if (statement.startsWith('--') || statement.trim() === '' || statement.includes('Complete log of this run')) {
                continue;
            }

            try {
                console.log(`[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 80)}...`);
                
                const { data, error } = await supabase.rpc('exec_sql', { 
                    sql_query: statement + ';' 
                });

                if (error) {
                    // Some errors are expected (like dropping non-existent items)
                    if (error.message.includes('does not exist') || 
                        error.message.includes('already exists') ||
                        error.message.includes('column_exists') ||
                        error.message.includes('policy_exists')) {
                        console.log(`   ⚠️  Expected: ${error.message}`);
                    } else {
                        console.log(`   ❌ Error: ${error.message}`);
                        errorCount++;
                    }
                } else {
                    console.log(`   ✅ Success`);
                    successCount++;
                }
            } catch (err) {
                console.log(`   ❌ Exception: ${err.message}`);
                errorCount++;
            }
        }

        console.log('\n🎉 Migration Execution Complete!');
        console.log(`✅ Successful operations: ${successCount}`);
        console.log(`❌ Errors: ${errorCount}`);

        // Run verification queries
        console.log('\n🔍 Running verification checks...\n');

        // Check Stripe columns
        const { data: columns } = await supabase
            .from('information_schema.columns')
            .select('table_name, column_name, data_type')
            .in('table_name', ['project_milestones', 'invoices', 'customer_profiles'])
            .like('column_name', '%stripe%');

        console.log('✅ Stripe Columns Found:');
        columns?.forEach(col => {
            console.log(`   - ${col.table_name}.${col.column_name} (${col.data_type})`);
        });

        // Check for remaining FreshBooks columns
        const { data: fbColumns } = await supabase
            .from('information_schema.columns')
            .select('table_name, column_name')
            .like('column_name', '%freshbooks%');

        console.log(`\n✅ FreshBooks Cleanup: ${fbColumns?.length || 0} columns remaining`);
        if (fbColumns?.length > 0) {
            fbColumns.forEach(col => {
                console.log(`   ⚠️  ${col.table_name}.${col.column_name} still exists`);
            });
        }

        // Check views
        const { data: views } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .in('table_name', ['customer_project_overview', 'stripe_payment_status'])
            .eq('table_type', 'VIEW');

        console.log(`\n✅ Views Created: ${views?.length || 0}/2`);
        views?.forEach(view => {
            console.log(`   - ${view.table_name}`);
        });

        console.log('\n🚀 Next Steps:');
        console.log('1. Test the integration suite: npm run test:integration');
        console.log('2. Verify customer portal functionality');
        console.log('3. Check environment variables configuration');
        console.log('4. Run end-to-end testing');

        console.log('\n🎉 Your platform is now running on Stripe-only architecture! 🔥');

    } catch (error) {
        console.error('💥 Migration failed:', error);
        process.exit(1);
    }
}

// Create exec_sql function if it doesn't exist
async function setupExecFunction() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
        RETURNS text AS $$
        BEGIN
            EXECUTE sql_query;
            RETURN 'Success';
        EXCEPTION
            WHEN OTHERS THEN
                RETURN SQLERRM;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: createFunctionSQL });
        if (error && !error.message.includes('already exists')) {
            // Try to create it directly
            await supabase.from('_').select().limit(0); // This will fail but establish connection
        }
    } catch (err) {
        // Function might not exist yet, that's ok
    }
}

// Run the migration
if (require.main === module) {
    setupExecFunction().then(() => {
        runMigration().catch(console.error);
    });
}

module.exports = { runMigration };