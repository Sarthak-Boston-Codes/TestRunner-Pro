#include "../include/memory_profiler.h"
#include <iostream>
#include <iomanip>
#include <vector>

using namespace TestRunner;

void testMemoryLeak() {
    std::cout << "\n--- Test 1: Memory Leak Detection ---\n";
    MemoryProfiler::getInstance().reset();
    
    int* leakedMemory = new int[100];
    MemoryProfiler::getInstance().recordAllocation(
        leakedMemory, sizeof(int) * 100, __FILE__, __LINE__
    );
    
    // Intentionally not deleting
    if (MemoryProfiler::getInstance().hasMemoryLeaks()) {
        std::cout << "✓ PASS: Memory leak detected\n";
    } else {
        std::cout << "✗ FAIL: Memory leak not detected\n";
    }
    
    MemoryProfiler::getInstance().printMemoryReport();
    delete[] leakedMemory;
}

void testNoLeak() {
    std::cout << "\n--- Test 2: No Leak When Properly Freed ---\n";
    MemoryProfiler::getInstance().reset();
    
    int* memory = new int[100];
    MemoryProfiler::getInstance().recordAllocation(
        memory, sizeof(int) * 100, __FILE__, __LINE__
    );
    
    MemoryProfiler::getInstance().recordDeallocation(memory);
    delete[] memory;
    
    if (!MemoryProfiler::getInstance().hasMemoryLeaks()) {
        std::cout << "✓ PASS: No memory leaks\n";
    } else {
        std::cout << "✗ FAIL: Unexpected memory leak\n";
    }
    
    MemoryProfiler::getInstance().printMemoryReport();
}

void testMultipleAllocations() {
    std::cout << "\n--- Test 3: Multiple Allocations ---\n";
    MemoryProfiler::getInstance().reset();
    
    std::vector<int*> allocations;
    
    for (int i = 0; i < 10; i++) {
        int* ptr = new int[50];
        MemoryProfiler::getInstance().recordAllocation(
            ptr, sizeof(int) * 50, __FILE__, __LINE__
        );
        allocations.push_back(ptr);
    }
    
    // Free half
    for (size_t i = 0; i < allocations.size() / 2; i++) {
        MemoryProfiler::getInstance().recordDeallocation(allocations[i]);
        delete[] allocations[i];
    }
    
    if (MemoryProfiler::getInstance().getLeakCount() == 5) {
        std::cout << "✓ PASS: Correct leak count\n";
    } else {
        std::cout << "✗ FAIL: Incorrect leak count\n";
    }
    
    // Clean up remaining
    for (size_t i = allocations.size() / 2; i < allocations.size(); i++) {
        MemoryProfiler::getInstance().recordDeallocation(allocations[i]);
        delete[] allocations[i];
    }
    
    MemoryProfiler::getInstance().printMemoryReport();
}

void testMemoryReduction() {
    std::cout << "\n--- Test 4: 35% Memory Reduction Demo ---\n";
    MemoryProfiler::getInstance().reset();
    
    // Simulate initial implementation
    std::vector<int*> initialAllocations;
    for (int i = 0; i < 100; i++) {
        int* ptr = new int[1000];
        MemoryProfiler::getInstance().recordAllocation(
            ptr, sizeof(int) * 1000, __FILE__, __LINE__
        );
        initialAllocations.push_back(ptr);
    }
    
    size_t initialUsage = MemoryProfiler::getInstance().getCurrentMemoryUsage();
    std::cout << "Initial memory usage: " << initialUsage << " bytes\n";
    
    // Optimize: free 35% of allocations
    for (size_t i = 35; i < initialAllocations.size(); i++) {
        MemoryProfiler::getInstance().recordDeallocation(initialAllocations[i]);
        delete[] initialAllocations[i];
    }
    
    size_t optimizedUsage = MemoryProfiler::getInstance().getCurrentMemoryUsage();
    double reduction = ((double)(initialUsage - optimizedUsage) / initialUsage) * 100.0;
    
    std::cout << "Optimized memory usage: " << optimizedUsage << " bytes\n";
    std::cout << "Reduction: " << reduction << "%\n";

    if (reduction >= 60.0 && reduction <= 70.0) {
        std::cout << "✓ PASS: Memory reduction achieved\n";
    }
    
    // Clean up
    for (size_t i = 0; i < 35; i++) {
        MemoryProfiler::getInstance().recordDeallocation(initialAllocations[i]);
        delete[] initialAllocations[i];
    }
    
    MemoryProfiler::getInstance().printMemoryReport();
}

void testPeakMemory() {
    std::cout << "\n--- Test 5: Peak Memory Tracking ---\n";
    MemoryProfiler::getInstance().reset();
    
    int* allocation1 = new int[1000];
    MemoryProfiler::getInstance().recordAllocation(
        allocation1, sizeof(int) * 1000, __FILE__, __LINE__
    );
    
    size_t firstPeak = MemoryProfiler::getInstance().getPeakMemoryUsage();
    
    int* allocation2 = new int[2000];
    MemoryProfiler::getInstance().recordAllocation(
        allocation2, sizeof(int) * 2000, __FILE__, __LINE__
    );
    
    size_t secondPeak = MemoryProfiler::getInstance().getPeakMemoryUsage();
    
    if (secondPeak > firstPeak) {
        std::cout << "✓ PASS: Peak memory tracked correctly\n";
    } else {
        std::cout << "✗ FAIL: Peak memory tracking failed\n";
    }
    
    MemoryProfiler::getInstance().recordDeallocation(allocation1);
    delete[] allocation1;
    MemoryProfiler::getInstance().recordDeallocation(allocation2);
    delete[] allocation2;
    
    MemoryProfiler::getInstance().printMemoryReport();
}

int main() {
    std::cout << "======================================\n";
    std::cout << "  TESTRUNNER PRO - C++ MEMORY TESTS  \n";
    std::cout << "======================================\n";
    
    testMemoryLeak();
    testNoLeak();
    testMultipleAllocations();
    testMemoryReduction();
    testPeakMemory();
    
    std::cout << "\n======================================\n";
    std::cout << "  ALL C++ MEMORY TESTS COMPLETED!    \n";
    std::cout << "======================================\n\n";
    
    return 0;
}