import hashlib
import pickle

def hash_instance(obj):
    """
    Generates a hash for a Python object based on its pickled representation.
    
    Args:
        obj: An instance of any Python class.
    
    Returns:
        A SHA256 hex digest string representing the object's contents.
    """
    try:
        # Serialize the object using pickle
        serialized_obj = pickle.dumps(obj)
        
        # Generate a SHA256 hash of the serialized object
        hash_digest = hashlib.sha256(serialized_obj).hexdigest()
        
        return hash_digest
    except Exception as e:
        raise ValueError(f"Failed to hash object: {e}")




