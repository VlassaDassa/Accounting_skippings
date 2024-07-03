def group_skippings(data):
    aggregated_data = {}
    for item in data:
        key = (item['period'], item['student'])
        if key not in aggregated_data:
            aggregated_data[key] = item.copy()
        else:
            aggregated_data[key]['valid_skipping'] += item['valid_skipping']
            aggregated_data[key]['invalid_skipping'] += item['invalid_skipping']
            aggregated_data[key]['all_skipping'] += item['all_skipping']

    result = list(aggregated_data.values())

    return result


def clean_date(data):
    for item in data:
        if 'date' in item:
            del item['date']

    return data