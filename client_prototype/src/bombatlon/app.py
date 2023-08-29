import time

from aircraft import Aircraft

aircraft = Aircraft()


def launch_bomb(aircraft):
    # TODO
    return


if __name__ == "__main__":

    while True:
        try:
            aircraft.update()

            if aircraft.bomb_detect:
                launch_bomb(aircraft)
            # print(f'{aircraft.point}, {aircraft.alt_agl}, {aircraft.gs}')
            time.sleep(0.5)
        except Exception as e:
            print(e)
