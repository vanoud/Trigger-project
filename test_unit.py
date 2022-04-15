import unittest
from unittest.mock import MagicMock
from app import *

test = MagicMock()
print(test)

class test_unitaire(unittest.TestCase):

    def test_sorted(self):
        resultat = sorted("1234")
        self.assertEqual(['1','2','3','4'], resultat)

    def test_upper(self):
        resultat = "TRIGGER".upper()
        self.assertEqual("TRIGGER", resultat)
    
    
if __name__ == '__main__':
    unittest.main()

