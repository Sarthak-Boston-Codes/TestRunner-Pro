cmake_minimum_required(VERSION 3.16)
project(TestRunnerMemoryProfiler)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Include directories
include_directories(include)

# Memory profiler library
add_library(memory_profiler src/memory_profiler.cpp)

# Memory tests executable
add_executable(memory_tests tests/memory_tests.cpp)
target_link_libraries(memory_tests memory_profiler)

# Enable testing
enable_testing()
add_test(NAME memory_tests COMMAND memory_tests)