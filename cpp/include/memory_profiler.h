#ifndef MEMORY_PROFILER_H
#define MEMORY_PROFILER_H

#include <unordered_map>
#include <string>
#include <chrono>
#include <mutex>

namespace TestRunner {

struct AllocationInfo {
    void* address;
    size_t size;
    std::string file;
    int line;
    std::chrono::steady_clock::time_point timestamp;
};

class MemoryProfiler {
private:
    std::unordered_map<void*, AllocationInfo> allocations;
    mutable std::mutex mutex;
    size_t totalAllocated = 0;
    size_t totalFreed = 0;
    size_t peakMemoryUsage = 0;
    size_t currentMemoryUsage = 0;

public:
    static MemoryProfiler& getInstance() {
        static MemoryProfiler instance;
        return instance;
    }

    void recordAllocation(void* ptr, size_t size, const char* file, int line);
    void recordDeallocation(void* ptr);
    void printMemoryReport() const;
    bool hasMemoryLeaks() const;
    size_t getLeakCount() const;
    size_t getLeakSize() const;
    void reset();
    
    size_t getPeakMemoryUsage() const { return peakMemoryUsage; }
    size_t getCurrentMemoryUsage() const { return currentMemoryUsage; }
};

}

#endif