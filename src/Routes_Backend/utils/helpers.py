def generate_next_id(prefix, model, id_field):
    """
    Generates the next ID in sequence (e.g., C001, C002)
    """
    last_record = model.query.order_by(id_field.desc()).first()
    if last_record:
        last_id = getattr(last_record, id_field.name)
        # Extract numeric part
        num = int(last_id[len(prefix):]) + 1
    else:
        num = 1
    return f"{prefix}{num:03d}"