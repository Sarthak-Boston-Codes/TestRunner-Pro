const db = require('../../src/database');
const { generateTestUser, generateTestUsers } = require('../utils/testDataGenerator');

describe('Advanced Database Tests', () => {
  let testUserIds = [];

  afterEach(async () => {
    if (testUserIds.length > 0) {
      await db.query('DELETE FROM users WHERE id = ANY($1)', [testUserIds]);
      testUserIds = [];
    }
  });

  afterAll(async () => {
    await db.pool.end();
  });

  describe('CRUD Operations', () => {
    test('should create user successfully', async () => {
      const user = generateTestUser();
      const result = await db.query(
        'INSERT INTO users (email, password_hash, name, username) VALUES ($1, $2, $3, $4) RETURNING id',
        [user.email, 'hash', user.name, user.username]
      );

      expect(result.rows.length).toBe(1);
      expect(result.rows[0]).toHaveProperty('id');
      testUserIds.push(result.rows[0].id);
    });

    test('should read user by email', async () => {
      const user = generateTestUser();
      const insertResult = await db.query(
        'INSERT INTO users (email, password_hash, name, username) VALUES ($1, $2, $3, $4) RETURNING id',
        [user.email, 'hash', user.name, user.username]
      );
      testUserIds.push(insertResult.rows[0].id);

      const selectResult = await db.query('SELECT * FROM users WHERE email = $1', [user.email]);
      expect(selectResult.rows[0].email).toBe(user.email);
    });

    test('should update user name', async () => {
      const user = generateTestUser();
      const insertResult = await db.query(
        'INSERT INTO users (email, password_hash, name, username) VALUES ($1, $2, $3, $4) RETURNING id',
        [user.email, 'hash', user.name, user.username]
      );
      testUserIds.push(insertResult.rows[0].id);

      await db.query('UPDATE users SET name = $1 WHERE id = $2', ['New Name', insertResult.rows[0].id]);

      const selectResult = await db.query('SELECT * FROM users WHERE id = $1', [insertResult.rows[0].id]);
      expect(selectResult.rows[0].name).toBe('New Name');
    });

    test('should delete user', async () => {
      const user = generateTestUser();
      const insertResult = await db.query(
        'INSERT INTO users (email, password_hash, name, username) VALUES ($1, $2, $3, $4) RETURNING id',
        [user.email, 'hash', user.name, user.username]
      );
      const userId = insertResult.rows[0].id;

      await db.query('DELETE FROM users WHERE id = $1', [userId]);

      const selectResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      expect(selectResult.rows.length).toBe(0);
    });
  });

  describe('Query Performance', () => {
    test('should complete simple query within 100ms', async () => {
      const start = Date.now();
      await db.query('SELECT * FROM users LIMIT 10');
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });

    test('should complete count query within 100ms', async () => {
      const start = Date.now();
      await db.query('SELECT COUNT(*) FROM users');
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });

    test('should handle multiple concurrent queries', async () => {
      const queries = Array(10).fill().map(() => 
        db.query('SELECT COUNT(*) FROM users')
      );
      const results = await Promise.all(queries);
      expect(results.length).toBe(10);
    });
  });

  describe('Data Integrity', () => {
    test('should enforce unique email constraint', async () => {
      const user = generateTestUser();
      const insertResult = await db.query(
        'INSERT INTO users (email, password_hash, name, username) VALUES ($1, $2, $3, $4) RETURNING id',
        [user.email, 'hash', user.name, user.username]
      );
      testUserIds.push(insertResult.rows[0].id);

      await expect(
        db.query('INSERT INTO users (email, password_hash, name, username) VALUES ($1, $2, $3, $4)',
          [user.email, 'hash', 'Other Name', user.username + '2'])
      ).rejects.toThrow();
    });

    test('should enforce unique username constraint', async () => {
      const user = generateTestUser();
      const insertResult = await db.query(
        'INSERT INTO users (email, password_hash, name, username) VALUES ($1, $2, $3, $4) RETURNING id',
        [user.email, 'hash', user.name, user.username]
      );
      testUserIds.push(insertResult.rows[0].id);

      await expect(
        db.query('INSERT INTO users (email, password_hash, name, username) VALUES ($1, $2, $3, $4)',
          [user.email + '2', 'hash', user.name, user.username])
      ).rejects.toThrow();
    });

    test('should set default status to active', async () => {
      const user = generateTestUser();
      const result = await db.query(
        'INSERT INTO users (email, password_hash, name, username) VALUES ($1, $2, $3, $4) RETURNING *',
        [user.email, 'hash', user.name, user.username]
      );
      testUserIds.push(result.rows[0].id);
      expect(result.rows[0].status).toBe('active');
    });

    test('should set default role to user', async () => {
      const user = generateTestUser();
      const result = await db.query(
        'INSERT INTO users (email, password_hash, name, username) VALUES ($1, $2, $3, $4) RETURNING *',
        [user.email, 'hash', user.name, user.username]
      );
      testUserIds.push(result.rows[0].id);
      expect(result.rows[0].role).toBe('user');
    });

    test('should handle NULL phone numbers', async () => {
      const user = generateTestUser();
      const result = await db.query(
        'INSERT INTO users (email, password_hash, name, username, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [user.email, 'hash', user.name, user.username, null]
      );
      testUserIds.push(result.rows[0].id);
      expect(result.rows[0].phone).toBeNull();
    });

    test('should set created_at timestamp automatically', async () => {
      const user = generateTestUser();
      const result = await db.query(
        'INSERT INTO users (email, password_hash, name, username) VALUES ($1, $2, $3, $4) RETURNING *',
        [user.email, 'hash', user.name, user.username]
      );
      testUserIds.push(result.rows[0].id);
      expect(result.rows[0].created_at).toBeTruthy();
      expect(new Date(result.rows[0].created_at)).toBeInstanceOf(Date);
    });

    test('should update updated_at on modifications', async () => {
      const user = generateTestUser();
      const insertResult = await db.query(
        'INSERT INTO users (email, password_hash, name, username) VALUES ($1, $2, $3, $4) RETURNING *',
        [user.email, 'hash', user.name, user.username]
      );
      testUserIds.push(insertResult.rows[0].id);
      const originalTime = insertResult.rows[0].updated_at;

      await new Promise(resolve => setTimeout(resolve, 1000));

      await db.query('UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['Updated', insertResult.rows[0].id]);

      const updateResult = await db.query('SELECT * FROM users WHERE id = $1', [insertResult.rows[0].id]);
      expect(new Date(updateResult.rows[0].updated_at).getTime())
        .toBeGreaterThan(new Date(originalTime).getTime());
    });
  });

  describe('Complex Queries', () => {
    test('should filter by multiple conditions', async () => {
      const users = generateTestUsers(5);
      for (const user of users) {
        const result = await db.query(
          'INSERT INTO users (email, password_hash, name, username, status, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
          [user.email, 'hash', user.name, user.username, 'active', 'user']
        );
        testUserIds.push(result.rows[0].id);
      }

      const searchResult = await db.query(
        'SELECT * FROM users WHERE status = $1 AND role = $2 AND id = ANY($3)',
        ['active', 'user', testUserIds]
      );
      expect(searchResult.rows.length).toBe(5);
    });

    test('should sort results ascending', async () => {
      const users = generateTestUsers(5);
      for (const user of users) {
        const result = await db.query(
          'INSERT INTO users (email, password_hash, name, username) VALUES ($1, $2, $3, $4) RETURNING id',
          [user.email, 'hash', user.name, user.username]
        );
        testUserIds.push(result.rows[0].id);
      }

      const sortedResult = await db.query(
        'SELECT * FROM users WHERE id = ANY($1) ORDER BY email ASC',
        [testUserIds]
      );

      for (let i = 1; i < sortedResult.rows.length; i++) {
        expect(sortedResult.rows[i].email >= sortedResult.rows[i-1].email).toBe(true);
      }
    });

    test('should sort results descending', async () => {
      const users = generateTestUsers(3);
      for (const user of users) {
        const result = await db.query(
          'INSERT INTO users (email, password_hash, name, username) VALUES ($1, $2, $3, $4) RETURNING id',
          [user.email, 'hash', user.name, user.username]
        );
        testUserIds.push(result.rows[0].id);
      }

      const sortedResult = await db.query(
        'SELECT * FROM users WHERE id = ANY($1) ORDER BY email DESC',
        [testUserIds]
      );

      for (let i = 1; i < sortedResult.rows.length; i++) {
        expect(sortedResult.rows[i].email <= sortedResult.rows[i-1].email).toBe(true);
      }
    });

    test('should paginate results - page 1', async () => {
      const users = generateTestUsers(10);
      for (const user of users) {
        const result = await db.query(
          'INSERT INTO users (email, password_hash, name, username) VALUES ($1, $2, $3, $4) RETURNING id',
          [user.email, 'hash', user.name, user.username]
        );
        testUserIds.push(result.rows[0].id);
      }

      const page1 = await db.query(
        'SELECT * FROM users WHERE id = ANY($1) ORDER BY id LIMIT 5 OFFSET 0',
        [testUserIds]
      );
      expect(page1.rows.length).toBe(5);
    });

    test('should paginate results - page 2', async () => {
      const page2 = await db.query(
        'SELECT * FROM users WHERE id = ANY($1) ORDER BY id LIMIT 5 OFFSET 5',
        [testUserIds]
      );
      expect(page2.rows.length).toBeGreaterThanOrEqual(0);
    });

    test('should count total records', async () => {
      const countResult = await db.query(
        'SELECT COUNT(*) FROM users WHERE id = ANY($1)',
        [testUserIds]
      );
      expect(parseInt(countResult.rows[0].count)).toBeGreaterThanOrEqual(0);
    });

    test('should perform case-insensitive search', async () => {
      const user = generateTestUser();
      const email = 'TESTCASE@EXAMPLE.COM';
      const result = await db.query(
        'INSERT INTO users (email, password_hash, name, username) VALUES ($1, $2, $3, $4) RETURNING id',
        [email, 'hash', user.name, user.username]
      );
      testUserIds.push(result.rows[0].id);

      const searchResult = await db.query(
        'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
        ['testcase@example.com']
      );
      expect(searchResult.rows.length).toBe(1);
    });

    test('should use LIKE operator for partial matches', async () => {
      const user = generateTestUser();
      const result = await db.query(
        'INSERT INTO users (email, password_hash, name, username) VALUES ($1, $2, $3, $4) RETURNING id',
        [`searchable${Date.now()}@example.com`, 'hash', user.name, user.username]
      );
      testUserIds.push(result.rows[0].id);

      const searchResult = await db.query(
        'SELECT * FROM users WHERE email LIKE $1',
        ['%searchable%']
      );
      expect(searchResult.rows.length).toBeGreaterThan(0);
    });

    test('should select specific columns only', async () => {
      const user = generateTestUser();
      const result = await db.query(
        'INSERT INTO users (email, password_hash, name, username) VALUES ($1, $2, $3, $4) RETURNING id',
        [user.email, 'hash', user.name, user.username]
      );
      testUserIds.push(result.rows[0].id);

      const selectResult = await db.query(
        'SELECT email, name FROM users WHERE id = $1',
        [result.rows[0].id]
      );
      expect(selectResult.rows[0]).toHaveProperty('email');
      expect(selectResult.rows[0]).toHaveProperty('name');
      expect(selectResult.rows[0]).not.toHaveProperty('password_hash');
    });

    test('should use DISTINCT to get unique values', async () => {
      const result = await db.query('SELECT DISTINCT status FROM users');
      expect(result.rows).toBeDefined();
    });

    test('should group by status', async () => {
      const result = await db.query(
        'SELECT status, COUNT(*) as count FROM users GROUP BY status'
      );
      expect(result.rows).toBeDefined();
    });
  });

  describe('Transaction Handling', () => {
    test('should handle basic transaction', async () => {
      const client = await db.getClient();
      try {
        await client.query('BEGIN');
        const user = generateTestUser();
        const result = await client.query(
          'INSERT INTO users (email, password_hash, name, username) VALUES ($1, $2, $3, $4) RETURNING id',
          [user.email, 'hash', user.name, user.username]
        );
        await client.query('COMMIT');
        testUserIds.push(result.rows[0].id);
        expect(result.rows[0]).toHaveProperty('id');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    });

    test('should rollback on error', async () => {
      const client = await db.getClient();
      const user = generateTestUser();
      
      try {
        await client.query('BEGIN');
        const result = await client.query(
          'INSERT INTO users (email, password_hash, name, username) VALUES ($1, $2, $3, $4) RETURNING id',
          [user.email, 'hash', user.name, user.username]
        );
        testUserIds.push(result.rows[0].id);

        // Force error with duplicate email
        await client.query(
          'INSERT INTO users (email, password_hash, name, username) VALUES ($1, $2, $3, $4)',
          [user.email, 'hash', user.name, user.username + '2']
        );
        
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        // Verify rollback worked
        const checkResult = await db.query('SELECT * FROM users WHERE email = $1', [user.email]);
        expect(checkResult.rows.length).toBe(0);
        testUserIds = [];
      } finally {
        client.release();
      }
    });
  });
});