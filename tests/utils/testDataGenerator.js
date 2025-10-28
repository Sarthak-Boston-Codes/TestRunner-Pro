function generateTestUser() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000);
  
  return {
    id: `${timestamp}-${random}`,
    email: `test${timestamp}${random}@example.com`, // Added random for uniqueness
    password: 'SecurePass123!',
    name: `Test User ${random}`,
    username: `testuser${timestamp}${random}`, // Added timestamp for uniqueness
    avatar: 'https://i.pravatar.cc/150',
    phone: '+1-555-0123',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      country: 'USA'
    },
    status: 'active',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

function generateTestUsers(count = 100) {
  return Array.from({ length: count }, () => generateTestUser());
}

function generateProduct() {
  const random = Math.floor(Math.random() * 10000);
  return {
    id: `prod-${random}`,
    sku: `SKU${random}`,
    name: `Product ${random}`,
    description: 'Test product description',
    category: 'Electronics',
    price: 99.99,
    stock: 100,
    rating: 4.5,
    available: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

function generateEdgeCases() {
  return {
    emails: [
      'test@example.com',
      'test+tag@example.com',
      '',
      'invalid-email',
      'test@'
    ],
    passwords: [
      'SecurePass123!',
      '12345678',
      'password',
      'Pass1!',
      ''
    ],
    names: [
      'John Doe',
      'María García',
      'a',
      '',
      'Test<script>alert(1)</script>'
    ]
  };
}

function generateComprehensiveDataset(size = 1000) {
  console.log(`Generating ${size} test records...`);
  
  const dataset = {
    users: [],
    products: []
  };
  
  for (let i = 0; i < size; i++) {
    dataset.users.push(generateTestUser());
    dataset.products.push(generateProduct());
  }
  
  console.log(`Generated ${dataset.users.length} users and ${dataset.products.length} products`);
  return dataset;
}

module.exports = {
  generateTestUser,
  generateTestUsers,
  generateProduct,
  generateEdgeCases,
  generateComprehensiveDataset
};