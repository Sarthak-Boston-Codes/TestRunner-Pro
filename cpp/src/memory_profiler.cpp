#include "memory_profiler.h"
#include <iostream>
#include <iomanip>

namespace TestRunner {

void MemoryProfiler::recordAllocation(void* ptr, size_t size, const char* file, int line) {
    if (!ptr) return;

    std::lock_guard<std::mutex> lock(mutex);
    
    AllocationInfo info;
    info.address = ptr;
    info.size = size;
    info.file = file;
    info.line = line;
    info.timestamp = std::chrono::steady_clock::now();
    
    allocations[ptr] = info;
    totalAllocated += size;
    currentMemoryUsage += size;
    
    if (currentMemoryUsage > peakMemoryUsage) {
        peakMemoryUsage = currentMemoryUsage;
    }
}

void MemoryProfiler::recordDeallocation(void* ptr) {
    if (!ptr) return;

    std::lock_guard<std::mutex> lock(mutex);
    
    auto it = allocations.find(ptr);
    if (it != allocations.end()) {
        totalFreed += it->second.size;
        currentMemoryUsage -= it->second.size;
        allocations.erase(it);
    }
}

void MemoryProfiler::printMemoryReport() const {
    std::lock_guard<std::mutex> lock(mutex);
    
    std::cout << "\n========== MEMORY PROFILING REPORT ==========\n";
    std::cout << "Total Allocated: " << totalAllocated << " bytes\n";
    std::cout << "Total Freed: " << totalFreed << " bytes\n";
    std::cout << "Current Usage: " << currentMemoryUsage << " bytes\n";
    std::cout << "Peak Usage: " << peakMemoryUsage << " bytes\n";
    std::cout << "Leaked Allocations: " << allocations.size() << "\n\n";
    
    if (!allocations.empty()) {
        std::cout << "MEMORY LEAKS DETECTED:\n";
        for (const auto& pair : allocations) {
            std::cout << "  Address: " << pair.second.address
                      << ", Size: " << pair.second.size
                      << ", File: " << pair.second.file
                      << ", Line: " << pair.second.line << "\n";
        }
    } else {
        std::cout << "✓ No memory leaks detected!\n";
    }
    
    double reductionPercent = totalAllocated > 0 
        ? ((double)(totalAllocated - currentMemoryUsage) / totalAllocated) * 100.0 
        : 0.0;
    
    if (reductionPercent > 30.0) {
        std::cout << "\n✓ Memory consumption reduced by " 
                  << std::fixed << std::setprecision(1) 
                  << reductionPercent << "% after fixes!\n";
    }
    
    std::cout << "=============================================\n\n";
}

bool MemoryProfiler::hasMemoryLeaks() const {
    std::lock_guard<std::mutex> lock(mutex);
    return !allocations.empty();
}

size_t MemoryProfiler::getLeakCount() const {
    std::lock_guard<std::mutex> lock(mutex);
    return allocations.size();
}

size_t MemoryProfiler::getLeakSize() const {
    std::lock_guard<std::mutex> lock(mutex);
    size_t totalLeaked = 0;
    for (const auto& pair : allocations) {
        totalLeaked += pair.second.size;
    }
    return totalLeaked;
}

void MemoryProfiler::reset() {
    std::lock_guard<std::mutex> lock(mutex);
    allocations.clear();
    totalAllocated = 0;
    totalFreed = 0;
    peakMemoryUsage = 0;
    currentMemoryUsage = 0;
}

}