from database import fetch_all


def get_categories():
    return fetch_all("SELECT id, name, slug, parent_id, description FROM categories WHERE is_active = TRUE AND parent_id IS NULL ORDER BY name")


def get_teams():
    return fetch_all("SELECT id, name, slug, description, logo_path FROM teams WHERE is_active = TRUE ORDER BY name")


def get_sizes():
    return fetch_all("SELECT id, name, visual_order FROM sizes ORDER BY visual_order, name")


def get_colors():
    return fetch_all("SELECT id, name, hex_code FROM colors ORDER BY name")

