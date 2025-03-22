import XCTest
import SwiftTreeSitter
import TreeSitterTransparency

final class TreeSitterTransparencyTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_transparency())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Transparency grammar")
    }
}
