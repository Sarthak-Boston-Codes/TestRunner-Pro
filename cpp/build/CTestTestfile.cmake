# CMake generated Testfile for 
# Source directory: C:/Users/sarth/TestRunner-Pro/cpp
# Build directory: C:/Users/sarth/TestRunner-Pro/cpp/build
# 
# This file includes the relevant testing commands required for 
# testing this directory and lists subdirectories to be tested as well.
if(CTEST_CONFIGURATION_TYPE MATCHES "^([Dd][Ee][Bb][Uu][Gg])$")
  add_test(memory_tests "C:/Users/sarth/TestRunner-Pro/cpp/build/Debug/memory_tests.exe")
  set_tests_properties(memory_tests PROPERTIES  _BACKTRACE_TRIPLES "C:/Users/sarth/TestRunner-Pro/cpp/CMakeLists.txt;19;add_test;C:/Users/sarth/TestRunner-Pro/cpp/CMakeLists.txt;0;")
elseif(CTEST_CONFIGURATION_TYPE MATCHES "^([Rr][Ee][Ll][Ee][Aa][Ss][Ee])$")
  add_test(memory_tests "C:/Users/sarth/TestRunner-Pro/cpp/build/Release/memory_tests.exe")
  set_tests_properties(memory_tests PROPERTIES  _BACKTRACE_TRIPLES "C:/Users/sarth/TestRunner-Pro/cpp/CMakeLists.txt;19;add_test;C:/Users/sarth/TestRunner-Pro/cpp/CMakeLists.txt;0;")
elseif(CTEST_CONFIGURATION_TYPE MATCHES "^([Mm][Ii][Nn][Ss][Ii][Zz][Ee][Rr][Ee][Ll])$")
  add_test(memory_tests "C:/Users/sarth/TestRunner-Pro/cpp/build/MinSizeRel/memory_tests.exe")
  set_tests_properties(memory_tests PROPERTIES  _BACKTRACE_TRIPLES "C:/Users/sarth/TestRunner-Pro/cpp/CMakeLists.txt;19;add_test;C:/Users/sarth/TestRunner-Pro/cpp/CMakeLists.txt;0;")
elseif(CTEST_CONFIGURATION_TYPE MATCHES "^([Rr][Ee][Ll][Ww][Ii][Tt][Hh][Dd][Ee][Bb][Ii][Nn][Ff][Oo])$")
  add_test(memory_tests "C:/Users/sarth/TestRunner-Pro/cpp/build/RelWithDebInfo/memory_tests.exe")
  set_tests_properties(memory_tests PROPERTIES  _BACKTRACE_TRIPLES "C:/Users/sarth/TestRunner-Pro/cpp/CMakeLists.txt;19;add_test;C:/Users/sarth/TestRunner-Pro/cpp/CMakeLists.txt;0;")
else()
  add_test(memory_tests NOT_AVAILABLE)
endif()
